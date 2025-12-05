package com.kaizenflow.doitnow.mapper;

import com.kaizenflow.doitnow.dto.UserRequest;
import com.kaizenflow.doitnow.dto.UserResponse;
import com.kaizenflow.doitnow.entity.User;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.MappingTarget;

@Mapper(componentModel = "spring")
public interface UserMapper {

    UserResponse toResponse(User user);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "todos", ignore = true)
    User toEntity(UserRequest request);

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "todos", ignore = true)
    void updateEntityFromRequest(UserRequest request, @MappingTarget User user);
}
