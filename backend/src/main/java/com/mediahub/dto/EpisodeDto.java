package com.mediahub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EpisodeDto {
    private Long id;
    private Integer seasonNumber;
    private Integer episodeNumber;
    private String title;
    private Integer durationMinutes;
    private String sourceUrl;
}
