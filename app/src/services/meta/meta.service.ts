import { createMetaHttpClient } from "./meta.client";

export async function getMetaAccountsIg(access_token: string): Promise<
  {
    page_id: string;
    page_name: string;
    page_token: string;
    ig_id: string;
    ig_username: string;
    ig_picture: string;
  }[]
> {
  const client = createMetaHttpClient();
  const { data } = await client.get("/me/accounts", {
    params: {
      access_token: access_token,
      fields:
        "name,access_token,instagram_business_account{id,username,profile_picture_url}",
    },
  });
  const accountsWithInstagram = data.data.filter(
    (page: any) => page.instagram_business_account,
  );

  return accountsWithInstagram.map((page: any) => ({
    page_id: page.id,
    page_name: page.name,
    page_token: page.access_token,
    ig_id: page.instagram_business_account.id,
    ig_username: page.instagram_business_account.username, // nome da conexão
    ig_picture: page.instagram_business_account.profile_picture_url,
  }));
}

export async function getMetaLeadInfo(props: {
  sender_id: string;
  page_token: string;
}) {
  const client = createMetaHttpClient();
  const { data } = await client.get(`/${props.sender_id}`, {
    params: {
      fields: "name,username,profile_picture_url",
      access_token: props.page_token,
    },
  });
  return {
    name: data.name,
    username: data.username,
    picture: data.profile_picture_url,
  };
}

export async function getMetaIgId(props: {
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
