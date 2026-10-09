package com.mediahub.repository;

import com.mediahub.entity.CrawlerSource;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CrawlerSourceRepository extends JpaRepository<CrawlerSource, Long> {
    List<CrawlerSource> findByActiveTrue();
    boolean existsByUrl(String url);
}
