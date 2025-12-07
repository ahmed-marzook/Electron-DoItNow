package com.kaizenflow.doitnow.user.dto;

import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class UserResponse {

    private Long id;
    private String username;
    private String email;
    private OffsetDateTime createdAt;
}
