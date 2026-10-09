package com.mediahub.service;

import com.mediahub.dto.WatchlistEntryDto;
import com.mediahub.entity.*;
import com.mediahub.exception.*;
import com.mediahub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WatchlistService {

    private final WatchlistEntryRepository watchlistRepository;
    private final UserRepository userRepository;
    private final SeriesRepository seriesRepository;

    public List<WatchlistEntryDto> getWatchlist(String username) {
        User user = getUser(username);
        return watchlistRepository.findByUserId(user.getId()).stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public WatchlistEntryDto addToWatchlist(String username, Long seriesId) {
        User user = getUser(username);
        if (watchlistRepository.existsByUserIdAndSeriesId(user.getId(), seriesId)) {
            throw new BadRequestException("Series already in watchlist");
        }
        Series series = seriesRepository.findById(seriesId)
                .orElseThrow(() -> new ResourceNotFoundException("Series not found"));

        WatchlistEntry entry = WatchlistEntry.builder()
                .user(user)
                .series(series)
                .build();

        return toDto(watchlistRepository.save(entry));
    }

    public WatchlistEntryDto updateStatus(String username, Long entryId, WatchStatus status) {
        User user = getUser(username);
        WatchlistEntry entry = watchlistRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist entry not found"));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not authorized");
        }

        entry.setStatus(status);
        return toDto(watchlistRepository.save(entry));
    }

    public void removeFromWatchlist(String username, Long entryId) {
        User user = getUser(username);
        WatchlistEntry entry = watchlistRepository.findById(entryId)
                .orElseThrow(() -> new ResourceNotFoundException("Watchlist entry not found"));

        if (!entry.getUser().getId().equals(user.getId())) {
            throw new BadRequestException("Not authorized");
        }

        watchlistRepository.delete(entry);
    }

    private User getUser(String username) {
        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private WatchlistEntryDto toDto(WatchlistEntry e) {
        int totalEpisodes = e.getSeries().getEpisodes() != null ? e.getSeries().getEpisodes().size() : 0;
        return new WatchlistEntryDto(e.getId(), e.getSeries().getId(), e.getSeries().getTitle(),
                e.getSeries().getPosterUrl(), e.getStatus(), e.getEpisodesWatched(), totalEpisodes);
    }
}
