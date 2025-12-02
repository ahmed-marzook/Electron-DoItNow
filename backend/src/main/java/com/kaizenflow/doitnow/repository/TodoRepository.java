package com.kaizenflow.doitnow.repository;

import com.kaizenflow.doitnow.entity.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    List<Todo> findByCompleted(Boolean completed);

    List<Todo> findByPriority(String priority);

    List<Todo> findByDueDateBetween(OffsetDateTime start, OffsetDateTime end);

    List<Todo> findByCompletedOrderByDueDateAsc(Boolean completed);
}
