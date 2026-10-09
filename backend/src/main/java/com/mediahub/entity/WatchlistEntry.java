package com.mediahub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "watchlist_entries",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "series_id"}))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class WatchlistEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "series_id", nullable = false)
    private Series series;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private WatchStatus status = WatchStatus.PLAN_TO_WATCH;

    @Builder.Default
    private Integer episodesWatched = 0;
}
