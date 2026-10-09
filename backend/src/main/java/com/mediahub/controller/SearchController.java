package com.mediahub.controller;

import com.mediahub.dto.SearchResultDto;
import com.mediahub.service.SearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/search")
@RequiredArgsConstructor
public class SearchController {

    private final SearchService searchService;

    @GetMapping
    public ResponseEntity<List<SearchResultDto>> search(
            @RequestParam String q,
            @RequestParam(required = false) String type) {
        return ResponseEntity.ok(searchService.search(q, type));
    }
}
