package com.mediahub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchSettingsDto {
    private Long id;
    private String preferredQuality;
    private String audioLanguage;
    private String subtitleLanguage;
    private Integer maxResults;
    private boolean safeSearch;
    private Integer searchTimeoutSeconds;
}
