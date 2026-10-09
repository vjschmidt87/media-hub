package com.mediahub.entity;

import jakarta.persistence.*;
import lombok.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "series")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Series {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String posterUrl;
    private String type;
    private Integer year;

    @Column(columnDefinition = "TEXT")
    private String sourceUrl;

    private Integer totalEpisodes;

    @ElementCollection
    @CollectionTable(name = "series_genres", joinColumns = @JoinColumn(name = "series_id"))
    @Column(name = "genre")
    @Builder.Default
    private List<String> genres = new ArrayList<>();

    @OneToMany(mappedBy = "series", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Episode> episodes = new ArrayList<>();
}
