package com.kaizenflow.doitnow.repository;

import com.kaizenflow.doitnow.entity.Todo;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

@Repository
public interface TodoRepository extends JpaRepository<Todo, Long> {

    Optional<Todo> findByEntityId(@Param("entityId") Long entityId);

    List<Todo> findByCompleted(Boolean completed);

    List<Todo> findByPriority(String priority);

    List<Todo> findByDueDateBetween(OffsetDateTime start, OffsetDateTime end);

    List<Todo> findByCompletedOrderByDueDateAsc(Boolean completed);
}
