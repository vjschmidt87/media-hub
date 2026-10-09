package com.mediahub.service;

import lombok.extern.slf4j.Slf4j;
import org.jsoup.Jsoup;
import org.jsoup.nodes.Document;
import org.jsoup.nodes.Element;
import org.jsoup.select.Elements;
import org.springframework.stereotype.Service;

import com.mediahub.entity.CrawlerSource;

import javax.net.ssl.*;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.security.cert.X509Certificate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
public class ScraperService {

    private static final String USER_AGENT =
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";
    private static final int TIMEOUT_MS = 12000;

    public record ScrapedSeries(String title, String seriesPageUrl, String posterUrl) {}
    public record ScrapedEpisode(int episodeNumber, int seasonNumber, String title, String episodePageUrl) {}

    public List<ScrapedSeries> searchSeries(CrawlerSource source, String query) {
        try {
            String searchUrl = buildSearchUrl(source.getUrl(), query);
            log.info("Crawling {} for '{}'", searchUrl, query);
            Document doc = fetch(searchUrl);
            return parseSearchResults(doc);
        } catch (Exception e) {
            log.warn("Scrape failed for {} ({}): {}", source.getName(), source.getUrl(), e.getMessage());
            return List.of();
        }
    }

    public List<ScrapedEpisode> getEpisodes(String seriesPageUrl) {
        try {
            Document doc = fetch(seriesPageUrl);
            return parseEpisodes(doc, seriesPageUrl);
        } catch (Exception e) {
            log.warn("Episode fetch failed for {}: {}", seriesPageUrl, e.getMessage());
            return List.of();
        }
    }

    public Optional<String> resolveStreamUrl(String episodePageUrl) {
        try {
            Document doc = fetch(episodePageUrl);
            return extractStreamUrl(doc);
        } catch (Exception e) {
            log.warn("Stream URL resolution failed for {}: {}", episodePageUrl, e.getMessage());
            return Optional.empty();
        }
    }

    private Document fetch(String url) throws IOException {
        return Jsoup.connect(url)
            .userAgent(USER_AGENT)
            .header("Accept", "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8")
            .header("Accept-Language", "pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7")
            .header("Referer", "https://www.google.com/")
            .timeout(TIMEOUT_MS)
            .followRedirects(true)
            .get();
    }

    private String buildSearchUrl(String baseUrl, String query) {
        String base = baseUrl.endsWith("/") ? baseUrl.substring(0, baseUrl.length() - 1) : baseUrl;
        String domain = getDomain(baseUrl);
        String encoded = URLEncoder.encode(query.trim().toLowerCase(), StandardCharsets.UTF_8);
        String slug = query.trim().toLowerCase()
            .replaceAll("[^a-z0-9\\s-]", "")
            .replaceAll("\\s+", "-");

        return switch (domain) {
            case "animefire.plus"    -> base + "/pesquisar/" + slug;
            case "animesdigital.org" -> base + "/?s=" + encoded;
            case "goanimes.net"      -> base + "/?s=" + encoded;
            case "animesonline.cc"   -> base + "/?s=" + encoded;
            case "superflix.top"     -> base + "/?s=" + encoded;
            case "megafilmes.net"    -> base + "/?s=" + encoded;
            case "flixhq.to"         -> base + "/search/" + slug;
            default                  -> base + "/?s=" + encoded;
        };
    }

    private List<ScrapedSeries> parseSearchResults(Document doc) {
        // Each selector-set: [container, link, image]
        String[][] selectorSets = {
            {"article.type-post", ".entry-title a, h2 a, h3 a", "img"},
            {"article",           ".entry-title a, h2 a",        "img.wp-post-image, .post-thumbnail img"},
            {".item",             ".name a, h3 a, a.name",       ".poster img, img"},
            {".film-item",        ".film-name a",                 ".film-poster img"},
            {".post",             "a.entry-link, .post-title a",  ".post-thumbnail img"},
            {".data",             "h3 a",                         null},
        };

        for (String[] sel : selectorSets) {
            Elements containers = doc.select(sel[0]);
            if (containers.isEmpty()) continue;

            List<ScrapedSeries> results = new ArrayList<>();
            for (Element container : containers.stream().limit(6).toList()) {
                Element link = container.selectFirst(sel[1]);
                if (link == null) continue;
                String href  = link.absUrl("href");
                String title = link.text().trim();
                if (href.isEmpty() || title.isEmpty()) continue;

                String poster = null;
                if (sel[2] != null) {
                    Element img = container.selectFirst(sel[2]);
                    if (img != null) {
                        poster = img.absUrl("src");
                        if (poster.isEmpty()) poster = img.absUrl("data-src");
                        if (poster.isEmpty()) poster = null;
                    }
                }
                results.add(new ScrapedSeries(title, href, poster));
            }
            if (!results.isEmpty()) return results;
        }

        // Fallback: grab any link whose href looks like a series/anime page
        return doc.select("a[href*=anime], a[href*=serie], a[href*=show]")
            .stream()
            .filter(a -> !a.text().isBlank())
            .limit(5)
            .map(a -> new ScrapedSeries(a.text().trim(), a.absUrl("href"), null))
            .filter(s -> !s.seriesPageUrl().isEmpty())
            .toList();
    }

    private List<ScrapedEpisode> parseEpisodes(Document doc, String seriesPageUrl) {
        String[] selectors = {
            "#episodios li a",
            ".episodios li a",
            ".episodios-list li a",
            ".list-capitulos li a",
            ".ep-list li a",
            ".episodes-list li a",
            ".listEp li a",
            "ul.episodio li a",
            ".episode-link",
            "a[href*='/episodio/']",
            "a[href*='/episode/']",
            "a[href*='ep-']",
        };

        for (String selector : selectors) {
            Elements links = doc.select(selector);
            if (links.isEmpty()) continue;

            List<ScrapedEpisode> episodes = new ArrayList<>();
            for (int i = 0; i < links.size(); i++) {
                Element link = links.get(i);
                String href = link.absUrl("href");
                if (href.isEmpty()) continue;
                String title = link.text().trim();
                if (title.isEmpty()) title = "Episode " + (i + 1);
                episodes.add(new ScrapedEpisode(i + 1, 1, title, href));
            }

            if (!episodes.isEmpty()) {
                return enrichWithSeasonInfo(episodes);
            }
        }

        return List.of();
    }

    private List<ScrapedEpisode> enrichWithSeasonInfo(List<ScrapedEpisode> episodes) {
        Pattern p = Pattern.compile(
            "(?:s(\\d+)e(\\d+)|season[/-](\\d+)[/-]episode[/-](\\d+)|(\\d+)x(\\d+))",
            Pattern.CASE_INSENSITIVE
        );

        return episodes.stream().map(ep -> {
            Matcher m = p.matcher(ep.episodePageUrl());
            if (!m.find()) return ep;
            String seasonStr = firstNonNull(m.group(1), m.group(3), m.group(5), "1");
            String epNumStr  = firstNonNull(m.group(2), m.group(4), m.group(6), String.valueOf(ep.episodeNumber()));
            return new ScrapedEpisode(Integer.parseInt(epNumStr), Integer.parseInt(seasonStr), ep.title(), ep.episodePageUrl());
        }).toList();
    }

    private Optional<String> extractStreamUrl(Document doc) {
        // 1. Iframe with player/embed keywords in src
        for (String sel : new String[]{
            "iframe[src*=player]", "iframe[src*=embed]",
            "iframe[src*=stream]", "iframe[src*=video]", "iframe[src*=watch]"
        }) {
            Element el = doc.selectFirst(sel);
            if (el != null) {
                String src = el.absUrl("src");
                if (!src.isEmpty()) return Optional.of(src);
            }
        }

        // 2. <video source> or <video src>
        Element videoSrc = doc.selectFirst("video source[src]");
        if (videoSrc != null) {
            String src = videoSrc.absUrl("src");
            if (!src.isEmpty()) return Optional.of(src);
        }
        Element video = doc.selectFirst("video[src]");
        if (video != null) {
            String src = video.absUrl("src");
            if (!src.isEmpty()) return Optional.of(src);
        }

        // 3. Any iframe (last resort)
        Element anyIframe = doc.selectFirst("iframe[src]");
        if (anyIframe != null) {
            String src = anyIframe.absUrl("src");
            if (!src.isEmpty()) return Optional.of(src);
        }

        // 4. Scan inline scripts for media file URLs
        Pattern mediaPattern = Pattern.compile(
            "['\"]([^'\"]+\\.(?:mp4|m3u8|webm)[^'\"]*)['\"]",
            Pattern.CASE_INSENSITIVE
        );
        for (Element script : doc.select("script:not([src])")) {
            Matcher m = mediaPattern.matcher(script.html());
            if (m.find()) return Optional.of(m.group(1));
        }

        return Optional.empty();
    }

    private String getDomain(String url) {
        try {
            String host = new java.net.URI(url).getHost();
            return host != null ? host.replace("www.", "") : "";
        } catch (Exception e) {
            return "";
        }
    }

    private String firstNonNull(String... values) {
        for (String v : values) {
            if (v != null) return v;
        }
        return "1";
    }
}
