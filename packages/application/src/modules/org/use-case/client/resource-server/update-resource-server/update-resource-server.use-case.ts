import {
	BadRequestException,
	inject, injectable, IUseCase,
	NotFoundException, SystemException
} from "@egc-io/ckit-lib";
import {
	BusinessModelReadOnlyFields,
	ResourceServer,
	IResourceServerRepository,
	RESOURCE_SERVER_REPO,
	PK_ResourceServer,
} from "@ring-oauth/core";

export type UpdateResourceServerUpdateIn = {
	org_id: string;
	resource_server_identifier: string;
	data: Partial<
		Omit<ResourceServer,
			| keyof PK_ResourceServer
			| BusinessModelReadOnlyFields
		>
	>;
};

@injectable()
export class UpdateResourceServerUseCase implements IUseCase<UpdateResourceServerUpdateIn, void> {
	private readonly restrictFields: (keyof ResourceServer)[] = [
		'identifier',
		'org_id',
		'created_at',
		'created_by',
	];

	constructor(
		@inject(RESOURCE_SERVER_REPO) private readonly $rsRepo: IResourceServerRepository
	) { }

	async execute(input: UpdateResourceServerUpdateIn): Promise<void> {
		let count: number;

		try {
			count = await this.$rsRepo.count({ where: { identifier: input.resource_server_identifier } });
		} catch (error) {
			throw new SystemException(`cannot verify entity ${error.message}`);
		}

		if (count === 0) {
			throw new NotFoundException(`resource server not found`);
		}

		const fields = Object.keys(input.data);
		for (const k of fields) {
			if (this.restrictFields.includes(k as keyof ResourceServer)) {
				throw new BadRequestException(`cannot update restricted field ${k}`);
			}
		}

		try {
			await this.$rsRepo.updateById({
				org_id: input.org_id,
				identifier: input.resource_server_identifier,
			}, {
				...input.data,
				updated_at: new Date(),
			});
		} catch (error) {
			throw new SystemException(`cannot update entity ${error.message}`);
		}

	}
}