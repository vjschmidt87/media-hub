package com.mediahub.controller;

import com.mediahub.dto.WatchlistEntryDto;
import com.mediahub.entity.WatchStatus;
import com.mediahub.service.WatchlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/watchlist")
@RequiredArgsConstructor
public class WatchlistController {

    private final WatchlistService watchlistService;

    @GetMapping
    public ResponseEntity<List<WatchlistEntryDto>> getWatchlist(
            @AuthenticationPrincipal UserDetails user) {
        return ResponseEntity.ok(watchlistService.getWatchlist(user.getUsername()));
    }

    @PostMapping
    public ResponseEntity<WatchlistEntryDto> addToWatchlist(
            @AuthenticationPrincipal UserDetails user,
            @RequestBody Map<String, Long> body) {
        return ResponseEntity.ok(watchlistService.addToWatchlist(user.getUsername(), body.get("seriesId")));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<WatchlistEntryDto> updateStatus(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id,
            @RequestBody Map<String, String> body) {
        WatchStatus status = WatchStatus.valueOf(body.get("status"));
        return ResponseEntity.ok(watchlistService.updateStatus(user.getUsername(), id, status));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(
            @AuthenticationPrincipal UserDetails user,
            @PathVariable Long id) {
        watchlistService.removeFromWatchlist(user.getUsername(), id);
        return ResponseEntity.noContent().build();
    }
}
