import { Args, Flags, Interfaces } from "@oclif/core";

export const BaseArgs: Interfaces.ArgInput = {
	org_id: Args.string({ required: true, name: 'org_id', description: 'organization id' })
};

export const FilterFlags: Interfaces.FlagInput = {
	limit: Flags.integer(),
	offset: Flags.integer(),
};