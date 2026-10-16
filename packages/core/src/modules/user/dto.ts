import { Relation } from "../../common";
import { Role } from "../org";
import { User } from "./entities";

export type WithUsers = Relation<User[], 'users'>;
export type WithRole = Relation<Role[], 'roles'>;