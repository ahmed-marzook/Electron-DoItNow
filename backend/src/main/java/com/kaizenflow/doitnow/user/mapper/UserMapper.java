package com.kaizenflow.doitnow.user.mapper;

import com.kaizenflow.doitnow.user.dto.UserRequest;
import com.kaizenflow.doitnow.user.dto.UserResponse;
import com.kaizenflow.doitnow.user.entity.User;
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
