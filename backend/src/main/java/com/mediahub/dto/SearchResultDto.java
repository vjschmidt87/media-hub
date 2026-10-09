package com.mediahub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDto {
    private Long id;
    private String title;
    private String type;
    private Integer year;
    private String posterUrl;
    private String description;
    private String sourceUrl;
    private String sourceName;
}
