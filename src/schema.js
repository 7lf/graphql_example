/* jshint esversion: 8*/

import { gql } from 'apollo-server';

const typeDefs = gql`

    input UserCreateInput {
        email: String!
        name: String!
        password: String!
    }
    input UserLoginInput {
        email: String!
        password: String!
    }

    type AuthPayLoad {
        token: String!
    }

    type User {
        id: ID!
        email: String!
        password: String!
    }

    input UsersFilter {
        id: Int
        email: String!
    }

    type Query { # здесь перечисляем запросы на получение данных
        Users(filter:UsersFilter): [User]
    }

    type Mutation { # здесь перечисляем запросы на изменение данных
        signupUser(data: UserCreateInput!) : AuthPayLoad!
        loginUser(data: UserLoginInput!) : AuthPayLoad!
    }
`;

export default typeDefs;