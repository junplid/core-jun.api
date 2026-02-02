import { createMetaHttpClient } from "./meta.client";

export async function getMetaAccounts(
  access_token: string,
): Promise<{ account_access_token: string; account_id: string }[]> {
  const client = createMetaHttpClient();
  const { data } = await client.get("/me/accounts", {
    params: { access_token: access_token },
  });
  console.log(data);
  return data.data?.map((s: any) => ({
    account_access_token: s.access_token,
    account_id: s.id,
  }));
}

export async function getMetaIstagramId(props: {
  account_access_token: string;
  account_id: string;
}) {
  const client = createMetaHttpClient();
  const { data } = await client.get(
    `/${props.account_id}?fields=instagram_business_account`,
    { params: { access_token: props.account_access_token } },
  );
  return data.instagram_business_account.id as string;
}

export async function metaSubscribedApps(props: {
  account_access_token: string;
  account_id: string;
}) {
  const client = createMetaHttpClient();
  const { data } = await client.post(
    `/${props.account_id}/subscribed_apps`,
    null,
    {
      params: {
        subscribed_fields: "messages,messaging_postbacks",
        access_token: props.account_access_token,
      },
    },
  );
  return data;
}
