package com.mediahub.service;

import com.mediahub.entity.*;
import com.mediahub.repository.*;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;


@Slf4j
@Service
@RequiredArgsConstructor
public class DataSeeder {

    private final UserRepository userRepository;
    private final CrawlerSourceRepository sourceRepository;
    private final SearchSettingsRepository settingsRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.username}")
    private String adminUsername;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Value("${app.admin.email}")
    private String adminEmail;

    @PostConstruct
    @Transactional
    public void seed() {
        seedAdmin();
        seedSources();
        seedSettings();
    }

    private void seedAdmin() {
        if (userRepository.existsByRole("ROLE_ADMIN")) {
            return;
        }
        userRepository.save(User.builder()
                .username(adminUsername)
                .email(adminEmail)
                .password(passwordEncoder.encode(adminPassword))
                .roles(new HashSet<>(Set.of("ROLE_USER", "ROLE_ADMIN")))
                .build());
        log.info("Admin user seeded: {}", adminUsername);
    }

    private void seedSources() {
        if (sourceRepository.count() > 0) return;

        List<CrawlerSource> sources = List.of(
            CrawlerSource.builder().name("AnimesDigital").url("https://animesdigital.org").category("anime").active(true).build(),
            CrawlerSource.builder().name("AnimeFire").url("https://animefire.plus").category("anime").active(true).build(),
            CrawlerSource.builder().name("GoAnimes").url("https://goanimes.net").category("anime").active(true).build(),
            CrawlerSource.builder().name("AnimesOnline").url("https://animesonline.cc").category("anime").active(true).build(),
            CrawlerSource.builder().name("BetaSeries").url("https://www.betaseries.com").category("series").active(true).build(),
            CrawlerSource.builder().name("SuperFlixTV").url("https://superflix.top").category("all").active(true).build(),
            CrawlerSource.builder().name("MegaFilmes").url("https://megafilmes.net").category("movies").active(true).build(),
            CrawlerSource.builder().name("FlixHQ").url("https://flixhq.to").category("all").active(true).build(),
            CrawlerSource.builder().name("Fmovies").url("https://fmovies.ps").category("all").active(false).build(),
            CrawlerSource.builder().name("AnimeUnity").url("https://animeunity.to").category("anime").active(true).build(),
            CrawlerSource.builder().name("Crunchyroll").url("https://crunchyroll.com").category("anime").active(false).build()
        );

        sourceRepository.saveAll(sources);
        log.info("Crawler sources seeded: {} sources", sources.size());
    }

    private void seedSettings() {
        if (settingsRepository.count() == 0) {
            settingsRepository.save(new SearchSettings());
            log.info("Default search settings seeded");
        }
    }

}
