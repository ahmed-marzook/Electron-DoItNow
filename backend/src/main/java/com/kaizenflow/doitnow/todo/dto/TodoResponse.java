package com.kaizenflow.doitnow.todo.dto;

import java.time.OffsetDateTime;
import lombok.Data;

@Data
public class TodoResponse {

    private Long id;
    private String title;
    private String description;
    private Boolean completed;
    private String priority;
    private OffsetDateTime dueDate;
    private String assignedTo;
    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
