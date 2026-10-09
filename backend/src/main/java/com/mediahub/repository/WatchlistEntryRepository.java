package com.mediahub.repository;

import com.mediahub.entity.WatchlistEntry;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface WatchlistEntryRepository extends JpaRepository<WatchlistEntry, Long> {
    List<WatchlistEntry> findByUserId(Long userId);
    Optional<WatchlistEntry> findByUserIdAndSeriesId(Long userId, Long seriesId);
    boolean existsByUserIdAndSeriesId(Long userId, Long seriesId);
}
