package com.kaizenflow.doitnow.repository;

import com.kaizenflow.doitnow.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Repository interface for accessing and managing {@link Todo} entities in the database.
 * <p>
 * Extends {@link JpaRepository} to provide standard CRUD operations and custom finders.
 * </p>
 */
@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    /**
     * Finds all Todos matching the specified completion status.
     *
     * @param completed The completion status to filter by.
     * @return A list of Todos with the given completion status.
     */
    List<Todo> findByCompleted(Boolean completed);

    /**
     * Finds all Todos matching the specified priority.
     *
     * @param priority The priority to filter by.
     * @return A list of Todos with the given priority.
     */
    List<Todo> findByPriority(String priority);

    /**
     * Finds all Todos with a due date falling within the specified range.
     *
     * @param start The start of the range (inclusive).
     * @param end   The end of the range (inclusive).
     * @return A list of Todos due between the start and end dates.
     */
    List<Todo> findByDueDateBetween(OffsetDateTime start, OffsetDateTime end);

    /**
     * Finds all Todos matching the specified completion status, ordered by due date in ascending order.
     *
     * @param completed The completion status to filter by.
     * @return A list of Todos, ordered by due date.
     */
    List<Todo> findByCompletedOrderByDueDateAsc(Boolean completed);
}
