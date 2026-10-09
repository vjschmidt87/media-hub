package com.mediahub.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "crawler_sources")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class CrawlerSource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String url;

    @Column(nullable = false)
    @Builder.Default
    private String category = "all";

    @Builder.Default
    private boolean active = true;
}
