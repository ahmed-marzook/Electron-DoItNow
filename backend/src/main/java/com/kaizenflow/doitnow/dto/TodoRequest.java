package com.kaizenflow.doitnow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class TodoRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private Boolean completed = false;

    @Pattern(regexp = "low|medium|high", message = "Priority must be low, medium, or high")
    private String priority = "medium";

    private OffsetDateTime dueDate;
}
