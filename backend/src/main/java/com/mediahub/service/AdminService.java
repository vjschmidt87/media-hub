package com.mediahub.service;

import com.mediahub.dto.*;
import com.mediahub.entity.*;
import com.mediahub.exception.*;
import com.mediahub.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final CrawlerSourceRepository sourceRepository;
    private final SearchSettingsRepository settingsRepository;

    public List<CrawlerSourceDto> getSources() {
        return sourceRepository.findAll().stream()
                .map(this::toSourceDto)
                .collect(Collectors.toList());
    }

    public CrawlerSourceDto addSource(CrawlerSourceDto dto) {
        if (sourceRepository.existsByUrl(dto.getUrl())) {
            throw new BadRequestException("Source URL already exists");
        }
        CrawlerSource source = CrawlerSource.builder()
                .name(dto.getName())
                .url(dto.getUrl())
                .category(dto.getCategory())
                .active(true)
                .build();
        return toSourceDto(sourceRepository.save(source));
    }

    public CrawlerSourceDto toggleSource(Long id, boolean active) {
        CrawlerSource source = sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Source not found"));
        source.setActive(active);
        return toSourceDto(sourceRepository.save(source));
    }

    public void removeSource(Long id) {
        if (!sourceRepository.existsById(id)) {
            throw new ResourceNotFoundException("Source not found");
        }
        sourceRepository.deleteById(id);
    }

    public SearchSettingsDto getSettings() {
        return settingsRepository.findAll().stream()
                .findFirst()
                .map(this::toSettingsDto)
                .orElseGet(() -> toSettingsDto(settingsRepository.save(new SearchSettings())));
    }

    public SearchSettingsDto updateSettings(SearchSettingsDto dto) {
        SearchSettings settings = settingsRepository.findAll().stream()
                .findFirst()
                .orElse(new SearchSettings());

        settings.setPreferredQuality(dto.getPreferredQuality());
        settings.setAudioLanguage(dto.getAudioLanguage());
        settings.setSubtitleLanguage(dto.getSubtitleLanguage());
        settings.setMaxResults(dto.getMaxResults());
        settings.setSafeSearch(dto.isSafeSearch());
        settings.setSearchTimeoutSeconds(dto.getSearchTimeoutSeconds());

        return toSettingsDto(settingsRepository.save(settings));
    }

    private CrawlerSourceDto toSourceDto(CrawlerSource s) {
        return new CrawlerSourceDto(s.getId(), s.getName(), s.getUrl(), s.getCategory(), s.isActive());
    }

    private SearchSettingsDto toSettingsDto(SearchSettings s) {
        return new SearchSettingsDto(s.getId(), s.getPreferredQuality(), s.getAudioLanguage(),
                s.getSubtitleLanguage(), s.getMaxResults(), s.isSafeSearch(), s.getSearchTimeoutSeconds());
    }
}
