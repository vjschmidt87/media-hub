package com.mediahub.repository;

import com.mediahub.entity.SearchSettings;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SearchSettingsRepository extends JpaRepository<SearchSettings, Long> {
}
