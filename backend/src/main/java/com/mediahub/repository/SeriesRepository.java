package com.mediahub.repository;

import com.mediahub.entity.Series;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.util.List;
import java.util.Optional;

public interface SeriesRepository extends JpaRepository<Series, Long> {
    @Query("SELECT s FROM Series s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%'))")
    List<Series> searchByTitle(String query);

    @Query("SELECT s FROM Series s WHERE LOWER(s.title) LIKE LOWER(CONCAT('%', :query, '%')) AND s.type = :type")
    List<Series> searchByTitleAndType(String query, String type);

    Optional<Series> findByTitleIgnoreCase(String title);
}
