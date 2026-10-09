package com.mediahub.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class AniListService {

    private static final String ENDPOINT = "https://graphql.anilist.co";
    private static final String QUERY =
        "{ Page(perPage: 5) { media(search: \"%s\", type: ANIME, sort: SEARCH_MATCH) {" +
        " id title { romaji english } episodes coverImage { large } startDate { year }" +
        " description(asHtml: false) genres } } }";

    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public record AniListAnime(
        int aniListId, String romajiTitle, String englishTitle,
        Integer episodes, String posterUrl, String description,
        Integer year, List<String> genres
    ) {}

    public List<AniListAnime> search(String query) {
        String gql = String.format("{\"query\":\"%s\"}", QUERY.replace("\"", "\\\"").formatted(query.replace("\"", "")));
        try {
            HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(ENDPOINT))
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(String.format(
                    "{\"query\":\"{ Page(perPage:5) { media(search:\\\"%s\\\",type:ANIME,sort:SEARCH_MATCH){ id title{romaji english} episodes coverImage{large} startDate{year} description(asHtml:false) genres } } }\"}",
                    query.replace("\"", "").replace("\\", "")
                )))
                .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return parse(response.body());
        } catch (Exception e) {
            log.warn("AniList search failed for '{}': {}", query, e.getMessage());
            return List.of();
        }
    }

    private List<AniListAnime> parse(String body) {
        try {
            JsonNode root = objectMapper.readTree(body);
            JsonNode media = root.path("data").path("Page").path("media");
            List<AniListAnime> results = new ArrayList<>();
            for (JsonNode node : media) {
                String romaji  = node.path("title").path("romaji").asText(null);
                String english = node.path("title").path("english").asText(null);
                Integer epCount = node.path("episodes").isNull() ? null : node.path("episodes").intValue();
                String poster  = node.path("coverImage").path("large").asText(null);
                String desc    = node.path("description").asText(null);
                Integer year   = node.path("startDate").path("year").isNull() ? null : node.path("startDate").path("year").intValue();
                List<String> genres = new ArrayList<>();
                node.path("genres").forEach(g -> genres.add(g.asText()));
                results.add(new AniListAnime(
                    node.path("id").asInt(), romaji, english,
                    epCount, poster, desc, year, genres
                ));
            }
            return results;
        } catch (Exception e) {
            log.warn("AniList response parse failed: {}", e.getMessage());
            return List.of();
        }
    }
}
