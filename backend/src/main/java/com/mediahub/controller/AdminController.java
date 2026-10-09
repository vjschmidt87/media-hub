package com.mediahub.controller;

import com.mediahub.dto.*;
import com.mediahub.service.AdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/sources")
    public ResponseEntity<List<CrawlerSourceDto>> getSources() {
        return ResponseEntity.ok(adminService.getSources());
    }

    @PostMapping("/sources")
    public ResponseEntity<CrawlerSourceDto> addSource(@RequestBody CrawlerSourceDto dto) {
        return ResponseEntity.ok(adminService.addSource(dto));
    }

    @PatchMapping("/sources/{id}")
    public ResponseEntity<CrawlerSourceDto> toggleSource(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> body) {
        return ResponseEntity.ok(adminService.toggleSource(id, body.get("active")));
    }

    @DeleteMapping("/sources/{id}")
    public ResponseEntity<Void> removeSource(@PathVariable Long id) {
        adminService.removeSource(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/settings")
    public ResponseEntity<SearchSettingsDto> getSettings() {
        return ResponseEntity.ok(adminService.getSettings());
    }

    @PutMapping("/settings")
    public ResponseEntity<SearchSettingsDto> updateSettings(@RequestBody SearchSettingsDto dto) {
        return ResponseEntity.ok(adminService.updateSettings(dto));
    }
}
