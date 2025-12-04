package com.kaizenflow.doitnow.controller;

import com.kaizenflow.doitnow.dto.TodoRequest;
import com.kaizenflow.doitnow.dto.TodoResponse;
import com.kaizenflow.doitnow.service.TodoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Controller for managing Todo items.
 * <p>
 * Provides REST API endpoints for creating, retrieving, updating, and deleting Todos.
 * </p>
 */
@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class TodoController {

    private final TodoService todoService;

    /**
     * Retrieves a list of Todos, optionally filtered by completion status or priority.
     *
     * @param completed Optional filter for completion status (true/false).
     * @param priority  Optional filter for priority level.
     * @return A list of {@link TodoResponse} objects matching the criteria.
     */
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAllTodos(
            @RequestParam(required = false) Boolean completed,
            @RequestParam(required = false) String priority) {

        if (completed != null) {
            return ResponseEntity.ok(todoService.getTodosByCompleted(completed));
        }

        if (priority != null) {
            return ResponseEntity.ok(todoService.getTodosByPriority(priority));
        }

        return ResponseEntity.ok(todoService.getAllTodos());
    }

    /**
     * Retrieves a specific Todo by its ID.
     *
     * @param id The ID of the Todo to retrieve.
     * @return The {@link TodoResponse} object for the requested Todo.
     */
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getTodoById(@PathVariable Long id) {
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    /**
     * Retrieves Todos with a due date within a specified range.
     *
     * @param start The start of the date range (inclusive).
     * @param end   The end of the date range (inclusive).
     * @return A list of {@link TodoResponse} objects falling within the date range.
     */
    @GetMapping("/due-date")
    public ResponseEntity<List<TodoResponse>> getTodosByDueDateRange(
            @RequestParam OffsetDateTime start,
            @RequestParam OffsetDateTime end) {
        return ResponseEntity.ok(todoService.getTodosByDueDateRange(start, end));
    }

    /**
     * Creates a new Todo.
     *
     * @param request The {@link TodoRequest} object containing the details of the Todo to create.
     * @return The created {@link TodoResponse} object.
     */
    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(@Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.createTodo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Updates an existing Todo.
     *
     * @param id      The ID of the Todo to update.
     * @param request The {@link TodoRequest} object containing the updated details.
     * @return The updated {@link TodoResponse} object.
     */
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.updateTodo(id, request);
        return ResponseEntity.ok(response);
    }

    /**
     * Toggles the completion status of a specific Todo.
     *
     * @param id The ID of the Todo to toggle.
     * @return The updated {@link TodoResponse} object with the new completion status.
     */
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoResponse> toggleTodoCompleted(@PathVariable Long id) {
        TodoResponse response = todoService.toggleTodoCompleted(id);
        return ResponseEntity.ok(response);
    }

    /**
     * Deletes a Todo by its ID.
     *
     * @param id The ID of the Todo to delete.
     * @return An empty response with status 204 No Content.
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(@PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
