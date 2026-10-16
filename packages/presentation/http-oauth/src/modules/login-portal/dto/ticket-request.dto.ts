import { TicketUsage } from "@ring-oauth/core";

export class UserInfoDTO {
	user_id: string;
	connection: string;
	username: string;
	email: string;
};

export class TicketChallengeDTO {
	usage: TicketUsage;
	email: string;
	connection: string;
	redirect_uri: string;
};