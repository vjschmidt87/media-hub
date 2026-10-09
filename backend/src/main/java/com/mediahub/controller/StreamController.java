package com.mediahub.controller;

import com.mediahub.service.ScraperService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@Slf4j
@RestController
@RequestMapping("/api/stream")
@RequiredArgsConstructor
public class StreamController {

    private final ScraperService scraperService;

    public record StreamResolveResponse(String streamUrl, String originalUrl, boolean resolved) {}

    @GetMapping("/resolve")
    public ResponseEntity<StreamResolveResponse> resolve(@RequestParam String url) {
        log.info("Resolving stream URL for: {}", url);
        Optional<String> streamUrl = scraperService.resolveStreamUrl(url);
        if (streamUrl.isPresent()) {
            return ResponseEntity.ok(new StreamResolveResponse(streamUrl.get(), url, true));
        }
        // Fall back to original URL — frontend will try to embed it directly
        return ResponseEntity.ok(new StreamResolveResponse(url, url, false));
    }
}
