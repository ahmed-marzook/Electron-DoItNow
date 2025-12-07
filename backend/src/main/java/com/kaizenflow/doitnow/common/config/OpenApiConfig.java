package com.kaizenflow.doitnow.common.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.servers.Server;
import java.util.List;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("DoItNow API")
                        .version("1.0.0")
                        .description(
                                "REST API for DoItNow - A modern todo management application with cloud sync capabilities")
                        .contact(new Contact()
                                .name("KaizenFlow")
                                .email("support@kaizenflow.com")
                                .url("https://github.com/ahmed-marzook/Electron-DoItNow"))
                        .license(new License().name("MIT License").url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Local Development Server"),
                        new Server().url("https://api.doitnow.app").description("Production Server")));
    }
}
