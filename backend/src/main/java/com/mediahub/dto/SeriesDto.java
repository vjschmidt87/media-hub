package com.mediahub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SeriesDto {
    private Long id;
    private String title;
    private String description;
    private String posterUrl;
    private String type;
    private Integer year;
    private List<String> genres;
    private List<EpisodeDto> episodes;
}
