package com.mediahub.controller;

import com.mediahub.dto.SeriesDto;
import com.mediahub.service.SeriesService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/series")
@RequiredArgsConstructor
public class SeriesController {

    private final SeriesService seriesService;

    @GetMapping("/{id}")
    public ResponseEntity<SeriesDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(seriesService.getById(id));
    }
}
