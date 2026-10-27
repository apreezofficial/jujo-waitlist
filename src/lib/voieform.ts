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

type ProformsSubmission = {
  id?: string | number;
  created_at?: string;
  createdAt?: string;
  status?: string;
  email?: string;
  source?: string;
  submitted_at?: string;
  fields?: {
    email?: string;
    source?: string;
    submitted_at?: string;
  };
};

type ProformsResponse = {
  status?: string;
  message?: string;
  submissions?: ProformsSubmission[];
  data?: ProformsSubmission[];
  total?: number;
  total_count?: number;
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
    `https://staging.proforms.top/f/submissions_api.php?api_key=${encodeURIComponent(
      formKey
    )}`,
    {
      headers: {
        Authorization: `Bearer ${accessKey}`,
        Accept: 'application/json',
      },
      cache: 'no-store',
    }
  );

  const data = (await response.json().catch(() => null)) as ProformsResponse | null;

  if (!response.ok) {
    throw new Error(
      data?.message ??
        `Proforms could not load submissions. Status: ${response.status}`
    );
  }

  const rawSubmissions = data?.submissions ?? data?.data ?? [];

  const submissions: WaitlistSubmission[] = rawSubmissions.map(
    (submission, index) => ({
      id: String(submission.id ?? index),
      created_at:
        submission.created_at ??
        submission.createdAt ??
        new Date().toISOString(),
      status: submission.status,
      fields: {
        email: submission.fields?.email ?? submission.email,
        source: submission.fields?.source ?? submission.source,
        submitted_at:
          submission.fields?.submitted_at ?? submission.submitted_at,
      },
    })
  );

  return {
    total: data?.total_count ?? data?.total ?? submissions.length,
    submissions,
  };
}
