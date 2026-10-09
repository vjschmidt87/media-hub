package com.mediahub.dto;

import com.mediahub.entity.WatchStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class WatchlistEntryDto {
    private Long id;
    private Long seriesId;
    private String seriesTitle;
    private String posterUrl;
    private WatchStatus status;
    private Integer episodesWatched;
    private Integer totalEpisodes;
}
