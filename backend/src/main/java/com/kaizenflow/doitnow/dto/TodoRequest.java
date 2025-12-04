package com.kaizenflow.doitnow.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Data Transfer Object (DTO) for creating or updating a Todo.
 * <p>
 * Contains all necessary fields to define a Todo item, including validation constraints.
 * </p>
 */
@Data
public class TodoRequest {

    /**
     * The title of the Todo.
     * <p>
     * Must not be blank and cannot exceed 255 characters.
     * </p>
     */
    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title must not exceed 255 characters")
    private String title;

    /**
     * A detailed description of the Todo.
     * <p>
     * This field is optional.
     * </p>
     */
    private String description;

    /**
     * The completion status of the Todo.
     * <p>
     * Defaults to {@code false} if not provided.
     * </p>
     */
    private Boolean completed = false;

    /**
     * The priority level of the Todo.
     * <p>
     * Must be one of: "low", "medium", "high". Defaults to "medium".
     * </p>
     */
    @Pattern(regexp = "low|medium|high", message = "Priority must be low, medium, or high")
    private String priority = "medium";

    /**
     * The due date and time for the Todo.
     * <p>
     * This field is optional.
     * </p>
     */
    private OffsetDateTime dueDate;
}
