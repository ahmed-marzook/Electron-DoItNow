package com.kaizenflow.doitnow.dto;

import com.kaizenflow.doitnow.entity.Todo;
import lombok.Data;

import java.time.OffsetDateTime;

@Data
public class TodoResponse {

    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;
    private OffsetDateTime dueDate;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;

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
