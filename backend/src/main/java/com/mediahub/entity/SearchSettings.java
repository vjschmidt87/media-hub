package com.mediahub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "search_settings")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class SearchSettings {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Builder.Default
    private String preferredQuality = "auto";

    @Builder.Default
    private String audioLanguage = "any";

    @Builder.Default
    private String subtitleLanguage = "none";

    @Builder.Default
    private Integer maxResults = 20;

    @Builder.Default
    private boolean safeSearch = false;

    @Builder.Default
    private Integer searchTimeoutSeconds = 15;
}
