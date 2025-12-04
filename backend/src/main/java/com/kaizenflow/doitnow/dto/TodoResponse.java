package com.kaizenflow.doitnow.dto;

import com.kaizenflow.doitnow.entity.Todo;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Data Transfer Object (DTO) for returning Todo details.
 * <p>
 * This class maps the internal {@link Todo} entity to a response format for API consumers.
 * </p>
 */
@Data
public class TodoResponse {

    /**
     * The unique identifier of the Todo.
     */
    private Long id;

    /**
     * The title of the Todo.
     */
    private String title;

    /**
     * The detailed description of the Todo.
     */
    private String description;

    /**
     * The completion status of the Todo.
     */
    private Boolean completed;

    /**
     * The priority level of the Todo.
     */
    private String priority;

    /**
     * The due date and time of the Todo.
     */
    private OffsetDateTime dueDate;

    /**
     * The timestamp when the Todo was created.
     */
    private OffsetDateTime createdAt;

    /**
     * The timestamp when the Todo was last updated.
     */
    private OffsetDateTime updatedAt;

    /**
     * Converts a {@link Todo} entity to a {@link TodoResponse} DTO.
     *
     * @param todo The Todo entity to convert.
     * @return A new {@link TodoResponse} containing the data from the entity.
     */
    public static TodoResponse fromEntity(Todo todo) {
        TodoResponse response = new TodoResponse();
        response.setId(todo.getId());
        response.setTitle(todo.getTitle());
        response.setDescription(todo.getDescription());
        response.setCompleted(todo.getCompleted());
        response.setPriority(todo.getPriority());
        response.setDueDate(todo.getDueDate());
        response.setCreatedAt(todo.getCreatedAt());
        response.setUpdatedAt(todo.getUpdatedAt());
        return response;
    }
}
