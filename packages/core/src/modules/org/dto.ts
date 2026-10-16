import { Relation } from "../../common";
import { Client, Permission, ResourceServer } from "./entities";

export type WithResourceServers = Relation<ResourceServer[], 'resource_servers'>;
export type WithClients = Relation<Client[], 'clients'>; export type WithPermissions = Relation<Permission[], 'permissions'>;