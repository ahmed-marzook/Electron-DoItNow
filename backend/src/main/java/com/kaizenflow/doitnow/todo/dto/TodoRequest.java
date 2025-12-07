package com.kaizenflow.doitnow.todo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class TodoRequest {

    @NotNull(message = "Entity ID is required")
    private Long entityId;

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    private String description;

    private Boolean completed = false;

    @Pattern(regexp = "low|medium|high", message = "Priority must be low, medium, or high")
    private String priority = "medium";

    private OffsetDateTime dueDate;

    private OffsetDateTime createdAt;
}
