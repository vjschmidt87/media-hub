package com.mediahub.service;

import com.mediahub.dto.*;
import com.mediahub.entity.Episode;
import com.mediahub.entity.Series;
import com.mediahub.exception.ResourceNotFoundException;
import com.mediahub.repository.SeriesRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class SeriesService {

    private final SeriesRepository seriesRepository;
    private final ScraperService scraperService;

    @Transactional
    public SeriesDto getById(Long id) {
        Series series = seriesRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Series not found: " + id));

        // Lazy-fetch real episodes when series has a sourceUrl but no episodes yet
        if (series.getEpisodes().isEmpty() && series.getSourceUrl() != null) {
            loadEpisodesFromSource(series);
        }

        return toDto(series);
    }

    private void loadEpisodesFromSource(Series series) {
        log.info("Fetching episodes from {} for '{}'", series.getSourceUrl(), series.getTitle());
        try {
            List<ScraperService.ScrapedEpisode> scraped = scraperService.getEpisodes(series.getSourceUrl());
            if (!scraped.isEmpty()) {
                List<Episode> episodes = scraped.stream()
                        .map(ep -> Episode.builder()
                                .series(series)
                                .seasonNumber(ep.seasonNumber())
                                .episodeNumber(ep.episodeNumber())
                                .title(ep.title())
                                .durationMinutes(null)
                                .sourceUrl(ep.episodePageUrl())
                                .build())
                        .toList();
                series.getEpisodes().addAll(episodes);
                seriesRepository.save(series);
                log.info("Scraped {} episodes for '{}'", episodes.size(), series.getTitle());
                return;
            }
        } catch (Exception e) {
            log.warn("Scrape failed for series {} ({}): {}", series.getId(), series.getTitle(), e.getMessage());
        }

        // Scraping failed or returned nothing — generate stubs from known episode count
        Integer total = series.getTotalEpisodes();
        if (total == null || total <= 0) return;

        log.info("Generating {} episode stubs for '{}' (source unreachable)", total, series.getTitle());
        List<Episode> stubs = new ArrayList<>();
        for (int i = 1; i <= total; i++) {
            stubs.add(Episode.builder()
                    .series(series)
                    .seasonNumber(1)
                    .episodeNumber(i)
                    .title(series.getTitle() + " - Episode " + i)
                    .durationMinutes(null)
                    // sourceUrl is the series search page on the streaming site
                    .sourceUrl(series.getSourceUrl())
                    .build());
        }
        series.getEpisodes().addAll(stubs);
        seriesRepository.save(series);
    }

    private SeriesDto toDto(Series s) {
        List<EpisodeDto> episodes = s.getEpisodes().stream()
                .map(e -> new EpisodeDto(e.getId(), e.getSeasonNumber(), e.getEpisodeNumber(),
                        e.getTitle(), e.getDurationMinutes(), e.getSourceUrl()))
                .sorted((a, b) -> {
                    int cmp = a.getSeasonNumber().compareTo(b.getSeasonNumber());
                    return cmp != 0 ? cmp : a.getEpisodeNumber().compareTo(b.getEpisodeNumber());
                })
                .collect(Collectors.toList());

        return new SeriesDto(s.getId(), s.getTitle(), s.getDescription(),
                s.getPosterUrl(), s.getType(), s.getYear(), s.getGenres(), episodes);
    }
}
