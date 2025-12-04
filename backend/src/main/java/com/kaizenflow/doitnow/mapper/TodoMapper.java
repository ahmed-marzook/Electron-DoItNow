package com.kaizenflow.doitnow.mapper;

import com.kaizenflow.doitnow.dto.TodoRequest;
import com.kaizenflow.doitnow.dto.TodoResponse;
import com.kaizenflow.doitnow.entity.Todo;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface TodoMapper {

    TodoResponse toResponse(Todo todo);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Todo toEntity(TodoRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "entityId", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    void updateEntityFromRequest(TodoRequest request, @MappingTarget Todo todo);
}
