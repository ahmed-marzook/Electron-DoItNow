package com.kaizenflow.doitnow.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;
import lombok.Data;

import java.time.OffsetDateTime;

/**
 * Entity class representing a Todo item in the database.
 * <p>
 * Maps to the "todos" table.
 * </p>
 */
@Entity
@Table(name = "todos")
@Data
public class Todo {

    /**
     * The unique identifier for the Todo.
     * <p>
     * Generated automatically by the database.
     * </p>
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * The title of the Todo.
     * <p>
     * Cannot be null and has a maximum length of 255 characters.
     * </p>
     */
    @Column(nullable = false, length = 255)
    private String title;

    /**
     * The detailed description of the Todo.
     * <p>
     * Stored as TEXT in the database.
     * </p>
     */
    @Column(columnDefinition = "TEXT")
    private String description;

    /**
     * The completion status of the Todo.
     * <p>
     * Cannot be null. Defaults to {@code false}.
     * </p>
     */
    @Column(nullable = false)
    private Boolean completed = false;

    /**
     * The priority level of the Todo.
     * <p>
     * Cannot be null. Defaults to "medium". Maximum length is 20 characters.
     * </p>
     */
    @Column(nullable = false, length = 20)
    private String priority = "medium";

    /**
     * The due date and time of the Todo.
     */
    @Column(name = "due_date")
    private OffsetDateTime dueDate;

    /**
     * The timestamp when the Todo was created.
     * <p>
     * Automatically set before persisting. Cannot be null and is not updatable.
     * </p>
     */
    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    /**
     * The timestamp when the Todo was last updated.
     * <p>
     * Automatically updated before any update operation. Cannot be null.
     * </p>
     */
    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Sets the creation and update timestamps before the entity is first persisted.
     */
    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    /**
     * Updates the update timestamp before the entity is updated.
     */
    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
