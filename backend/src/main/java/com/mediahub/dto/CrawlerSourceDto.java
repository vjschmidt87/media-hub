package com.mediahub.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CrawlerSourceDto {
    private Long id;
    private String name;
    private String url;
    private String category;
    private boolean active;
}
