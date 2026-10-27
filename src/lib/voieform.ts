export type WaitlistSubmission = {
  id: string;
  created_at: string;
  status?: string;
  fields: {
    email?: string;
    source?: string;
    submitted_at?: string;
  };
};

type VoieformResponse = {
  success?: boolean;
  total_count?: number;
  submissions?: WaitlistSubmission[];
};

export async function getWaitlistSubmissions() {
  const accessKey = process.env.VOIEFORM_ACCESS_KEY;
  const formKey = process.env.VOIEFORM_FORM_KEY;

  if (!accessKey || !formKey) {
    throw new Error(
      'Add VOIEFORM_ACCESS_KEY and VOIEFORM_FORM_KEY in Vercel Environment Variables.'
    );
  }

  const response = await fetch(
    `https://staging.proforms.top/forms/${encodeURIComponent(
      formKey
    )}/submissions?page=1&limit=100`,
    {
      headers: {
        Authorization: `Bearer ${accessKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  );

  if (!response.ok) {
    throw new Error(
      `Voieform could not load submissions. Status: ${response.status}`
    );
  }

  const data = (await response.json()) as VoieformResponse;

  return {
    total: data.total_count ?? data.submissions?.length ?? 0,
    submissions: data.submissions ?? [],
  };
}
