package com.mediahub.service;

import com.mediahub.dto.SearchResultDto;
import com.mediahub.entity.CrawlerSource;
import com.mediahub.entity.Series;
import com.mediahub.repository.CrawlerSourceRepository;
import com.mediahub.repository.SeriesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class SearchService {

    private final SeriesRepository seriesRepository;
    private final CrawlerSourceRepository sourceRepository;
    private final ScraperService scraperService;
    private final AniListService aniListService;

    @Transactional
    public List<SearchResultDto> search(String query, String type) {
        List<CrawlerSource> activeSources = sourceRepository.findByActiveTrue();

        // Return cached DB results first
        List<Series> dbResults = (type != null && !type.equalsIgnoreCase("all"))
                ? seriesRepository.searchByTitleAndType(query, type)
                : seriesRepository.searchByTitle(query);

        if (!dbResults.isEmpty()) {
            return dbResults.stream()
                    .map(s -> toDto(s, pickSource(activeSources, s.getType())))
                    .toList();
        }

        if (activeSources.isEmpty()) return List.of();

        boolean isAnimeSearch = "anime".equalsIgnoreCase(type) ||
            activeSources.stream().anyMatch(s -> "anime".equalsIgnoreCase(s.getCategory()));

        List<SearchResultDto> results = new ArrayList<>();

        // Try AniList for anime searches (it's a reliable public API)
        if (isAnimeSearch) {
            List<AniListService.AniListAnime> aniListResults = aniListService.search(query);
            for (AniListService.AniListAnime anime : aniListResults.stream().limit(5).toList()) {
                CrawlerSource animeSource = pickAnimeSource(activeSources);
                Series series = createFromAniList(anime, animeSource);
                results.add(toDto(series, animeSource));
            }
        }

        // Also try scraping sources (works for non-Cloudflare sites)
        if (results.size() < 3) {
            for (CrawlerSource source : activeSources.stream().limit(3).toList()) {
                if (results.size() >= 6) break;
                try {
                    List<ScraperService.ScrapedSeries> scraped = scraperService.searchSeries(source, query);
                    for (ScraperService.ScrapedSeries hit : scraped.stream().limit(2).toList()) {
                        Series series = findOrCreateFromScrape(hit, source, type);
                        results.add(toDto(series, source));
                    }
                } catch (Exception e) {
                    log.warn("Source '{}' crawl failed: {}", source.getName(), e.getMessage());
                }
            }
        }

        // Deduplicate by series ID (different AniList titles may map to same cached DB entry)
        Map<Long, SearchResultDto> deduped = new LinkedHashMap<>();
        for (SearchResultDto r : results) {
            deduped.putIfAbsent(r.getId(), r);
        }
        return new ArrayList<>(deduped.values());
    }

    private Series createFromAniList(AniListService.AniListAnime anime, CrawlerSource animeSource) {
        String title = anime.englishTitle() != null ? anime.englishTitle() : anime.romajiTitle();
        // Exact title match prevents "Dragon Ball Z" from matching "Dragon Ball Z Kai"
        java.util.Optional<Series> existing = seriesRepository.findByTitleIgnoreCase(title);
        if (existing.isPresent()) return existing.get();

        // Build a URL to search for this anime on the streaming source
        String sourceUrl = buildSourceSearchUrl(animeSource, anime.romajiTitle());

        Series series = Series.builder()
                .title(title)
                .description(cleanDescription(anime.description()))
                .type("anime")
                .posterUrl(anime.posterUrl())
                .year(anime.year())
                .genres(new ArrayList<>(anime.genres()))
                .sourceUrl(sourceUrl)
                .totalEpisodes(anime.episodes())
                .build();

        return seriesRepository.save(series);
    }

    private Series findOrCreateFromScrape(ScraperService.ScrapedSeries hit, CrawlerSource source, String requestedType) {
        List<Series> existing = seriesRepository.searchByTitle(hit.title());
        if (!existing.isEmpty()) return existing.get(0);

        String seriesType = resolveType(source.getCategory(), requestedType);
        Series series = Series.builder()
                .title(hit.title())
                .description("Found on " + source.getName())
                .type(seriesType)
                .posterUrl(hit.posterUrl())
                .sourceUrl(hit.seriesPageUrl())
                .genres(new ArrayList<>())
                .build();

        return seriesRepository.save(series);
    }

    private String buildSourceSearchUrl(CrawlerSource source, String title) {
        if (source == null) return null;
        String base = source.getUrl().endsWith("/") ? source.getUrl() : source.getUrl() + "/";
        String encoded = title.toLowerCase().replaceAll("[^a-z0-9\\s]", "").replaceAll("\\s+", "+");
        return base + "?s=" + encoded;
    }

    private String cleanDescription(String desc) {
        if (desc == null) return null;
        // Remove HTML tags that AniList sometimes includes despite asHtml:false
        return desc.replaceAll("<[^>]+>", "").replaceAll("\\s+", " ").trim();
    }

    private CrawlerSource pickAnimeSource(List<CrawlerSource> sources) {
        return sources.stream()
                .filter(s -> "anime".equalsIgnoreCase(s.getCategory()))
                .findFirst()
                .orElse(sources.isEmpty() ? null : sources.get(0));
    }

    private CrawlerSource pickSource(List<CrawlerSource> sources, String type) {
        if (sources.isEmpty()) return null;
        return sources.stream()
                .filter(s -> s.getCategory().equalsIgnoreCase(type) || "all".equalsIgnoreCase(s.getCategory()))
                .findFirst()
                .orElse(sources.get(0));
    }

    private String resolveType(String category, String requestedType) {
        if (requestedType != null && !requestedType.equalsIgnoreCase("all")) return requestedType.toLowerCase();
        if (category != null && !category.equalsIgnoreCase("all")) return category.toLowerCase();
        return "series";
    }

    private SearchResultDto toDto(Series s, CrawlerSource src) {
        return new SearchResultDto(
                s.getId(), s.getTitle(), s.getType(), s.getYear(),
                s.getPosterUrl(), s.getDescription(),
                src != null ? src.getUrl() : "",
                src != null ? src.getName() : "AniList");
    }
}
