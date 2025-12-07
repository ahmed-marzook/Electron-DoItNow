package com.kaizenflow.doitnow.todo.controller;

import com.kaizenflow.doitnow.todo.dto.TodoRequest;
import com.kaizenflow.doitnow.todo.dto.TodoResponse;
import com.kaizenflow.doitnow.todo.service.TodoService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.time.OffsetDateTime;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/todos")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
@Tag(name = "Todo Management", description = "APIs for managing todos and tasks")
public class TodoController {

    private final TodoService todoService;

    @Operation(
            summary = "Get all todos",
            description = "Retrieves all todos, with optional filtering by completion status or priority")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully retrieved todos")})
    @GetMapping
    public ResponseEntity<List<TodoResponse>> getAllTodos(
            @Parameter(description = "Filter by completion status") @RequestParam(required = false) Boolean completed,
            @Parameter(description = "Filter by priority (low, medium, high)") @RequestParam(required = false)
                    String priority) {

        if (completed != null) {
            return ResponseEntity.ok(todoService.getTodosByCompleted(completed));
        }

        if (priority != null) {
            return ResponseEntity.ok(todoService.getTodosByPriority(priority));
        }

        return ResponseEntity.ok(todoService.getAllTodos());
    }

    @Operation(summary = "Get todo by ID", description = "Retrieves a specific todo by its entity ID")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo found"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponse> getTodoById(
            @Parameter(description = "Todo entity ID", required = true) @PathVariable Long id) {
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    @Operation(
            summary = "Get todos by due date range",
            description = "Retrieves todos that are due within a specified date range")
    @ApiResponses(value = {@ApiResponse(responseCode = "200", description = "Successfully retrieved todos")})
    @GetMapping("/due-date")
    public ResponseEntity<List<TodoResponse>> getTodosByDueDateRange(
            @Parameter(description = "Start date", required = true) @RequestParam OffsetDateTime start,
            @Parameter(description = "End date", required = true) @RequestParam OffsetDateTime end) {
        return ResponseEntity.ok(todoService.getTodosByDueDateRange(start, end));
    }

    @Operation(summary = "Create new todo", description = "Creates a new todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Todo created successfully"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PostMapping
    public ResponseEntity<TodoResponse> createTodo(@Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.createTodo(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(summary = "Update todo", description = "Updates an existing todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo updated successfully"),
        @ApiResponse(responseCode = "404", description = "Todo not found"),
        @ApiResponse(responseCode = "400", description = "Invalid input")
    })
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponse> updateTodo(
            @Parameter(description = "Todo entity ID", required = true) @PathVariable Long id,
            @Valid @RequestBody TodoRequest request) {
        TodoResponse response = todoService.updateTodo(id, request);
        return ResponseEntity.ok(response);
    }

    @Operation(
            summary = "Toggle todo completion",
            description = "Toggles the completion status of a todo (completed ↔ not completed)")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Todo completion status toggled successfully"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    @PatchMapping("/{id}/toggle")
    public ResponseEntity<TodoResponse> toggleTodoCompleted(
            @Parameter(description = "Todo entity ID", required = true) @PathVariable Long id) {
        TodoResponse response = todoService.toggleTodoCompleted(id);
        return ResponseEntity.ok(response);
    }

    @Operation(summary = "Delete todo", description = "Deletes a todo item")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "204", description = "Todo deleted successfully"),
        @ApiResponse(responseCode = "404", description = "Todo not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodo(
            @Parameter(description = "Todo entity ID", required = true) @PathVariable Long id) {
        todoService.deleteTodo(id);
        return ResponseEntity.noContent().build();
    }
}
