import { demoCvData } from './cvForm'

// A neutral head-and-shoulders silhouette (160x160 PNG), inlined as a
// base64 data URI so it travels the exact same path an uploaded photo does —
// createCvSnapshot's getPhotoDataUrl only passes through
// `data:image/(png|jpeg);base64,...`, so an SVG data URI would be dropped.
// Used only to fill the profile-photo slot in preview thumbnails when they
// fall back to the demo CV (see buildThumbnailCv), so photo-capable
// templates don't render with an empty gap in the gallery, hero stack, and
// marquee.
const PLACEHOLDER_PROFILE_PHOTO = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAKAAAACgCAMAAAC8EZcfAAABlVBMVEXp6u63usLZ2+C4usPo6e3o6e67vsa2ucLHydC3usPCxMy5vMXMztXd3+Tc3uO+wcnR09ra3OLDxs64u8O3usTT1drGyNDf4ebQ0tjY2uC3u8Pj5Ojj5Onk5urk5eq6vcbn6OzV1t3m5+ze4OW+wsnh4ufDxs3AwsrJy9LJzNPo6ey9v8jo6O3n6O3P0tji4+fh4+fQ0djHytHR09nR0tnBw8vb3eLT1tu6vcXl5urT1NvS1Nu8vsbU1tzOz9bIy9Lh4ujFyM/AxMvR1Nrf4eXm5+vg4ebZ2t/Y2d++wMnIytHa2+C/wsq/wcri4+jh4+ja2+G5vMTS1NrKzdO4u8Tc3uK5vcXLzdTCxs3MzdW7v8ff4OW+wcjX2d7f3+XW2N7g4ubh4efExs7MztbFyNC9wMnQ09nKzNLi5OjAwsvS09rJy9O7vcXm5+q6vMXKzdTj5erd3uPDxc3Cxc3d3ePc3ePV1tzNz9XMz9W6vMbe3+S8v8fDxc7O0NbNz9bFx8++wMi8v8jn6e3l5+vW193V193Mz9aolE3GAAAACXBIWXMAAAsTAAALEwEAmpwYAAADhklEQVR42u3bZ1MaQRjA8aXdwx4ICgKKRhRRmi22GHsvidHYe2zpvffePncyeZXRIHcPd8/uZPb/CX5zzN1WGFOpVCqVSqVSqVQqlUqlUqlUqv+/hYqB4ZWRkZXh/ooF6XDnhrwJ+KuE9+VFeXSemTEOp+JjTo8UPPd+EAqU2nOL9zWOwxml34p+fBsOODOHPyfSt5iGot1pF+cL+MBAD5+I8jk5GMp1WYzvRRwMxiuEvL6rYLhwmYCxQwMTJerIR4/3YKpN6k92F5hsmdZXu2oWGK4hBUbBdF5KXwwQ7RACvRjgJTpfjQMDdNSSAc8Dqm4y4BwOuEvlOwRki0TAC1jgkMzvMOV7PIcFBml8LRwL5DQzhlFA10ECLMMDG0mAvXhgL81aCQ90kgCv4oE0i6cAHkizdprGAw9IgEk8MEnzpdawvkGioS6EBTYTAduwwCqqTS25X2LGcj6cr6+FakqdxQEf0W1cyv0L/+4KxjdPuHCfxQCrKTf3d837UqTHOog54Rrt/pvplV2n1DvAABr52eJzU2s7xxojr9wM8K6Ic4hXxn1bTMgx8S2jvqyog2OD8y4/E9ZQpYH9jgYmsMkbxXyfY0xorW1nPkTur2eiOyx8ZuKIjjIZOhj550fblWlisvTtR7PrxMnX0fcpJlW5wERWz6/H4+t5PTsRyEmFm5p0Ro6j4+m81sd5n5ZPj0d/RpyTUjxCd2Mkkyp08KSNlZe1itR1DISKzml4qF/QvZTYx6Dh3f3hafJftrrZ3IS1p4Hyi317A7G34NuiOnOv9VfiFu48Q0Gsw/L+EI/P2e1rWIKS8kVsnby2h6DkdPtGaHdVJVgQ77bpyO7BEVjUpi2L5NgXsKzta9b79l1gYa49Jss1gEL1C9xGELDlb4MP4AMTfZGnWF1W+arBpmat8e2E7QK6LPna1L0D29IsuG/m1sHGnpU+dVgGW4uU6ht12QsMl3iVxqODzekeuUa405W0ffh10H6g1irbEHeyAbyvPkEBfJOUbQy2bF7j1miA97FrlBkgCvuPnU9UwOs432NOBeS4v8PcBLImUECdDvgU40tyOmC8nvaiJZBczfRTAl8zoss72OYp75sT3VFvAtKa5FkMg0U3rLtpgeZ3GTK0wHuM7CYtEN2/7aEF9pgGBmmBKdPAQVrgtmngEi3QZxrY6SWN+nqhSqVSqVQqlUplTb8AB/AHKhCB29MAAAAASUVORK5CYII='

// The three deliberately text-only templates (typography, no photo slot in
// their design) — kept photo-free in preview thumbnails even though the
// demo CV below carries a placeholder photo.
const PHOTO_FREE_TEMPLATE_IDS = ['minimal', 'classicProfessional']

// Each thumbnail renders a real CVPreview (see components/TemplateThumbnail.jsx),
// so the card shows the layout the user is actually choosing rather than an
// abstract skeleton. A full preview would be needlessly heavy, so the CV is
// trimmed to what survives being shrunk to thumbnail size — the header, a
// couple of entries, and a few skills.
const THUMBNAIL_EXPERIENCE_COUNT = 2
const THUMBNAIL_EDUCATION_COUNT = 1
const THUMBNAIL_ITEM_COUNT = 3
const THUMBNAIL_SKILL_COUNT = 6
const THUMBNAIL_ABOUT_LENGTH = 240

function hasContent(formData) {
  if (!formData) {
    return false
  }

  return Boolean(
    formData.fullName?.trim()
      || formData.title?.trim()
      || formData.about?.trim()
      || formData.experience?.some((item) => item.role?.trim() || item.company?.trim()),
  )
}

// formData is optional — pass a real in-progress CV (falls back to the demo
// CV if it's still empty) or omit it entirely to always use the demo CV,
// which is what the landing page's template preview does.
export function buildThumbnailCv(formData) {
  const usingDemo = !hasContent(formData)
  const source = usingDemo ? demoCvData : formData
  const take = (value, count) => (Array.isArray(value) ? value.slice(0, count) : [])

  // Fill the profile-photo slot for the demo-CV fallback only, so photo-capable
  // templates preview with a portrait instead of an empty gap. A real
  // in-progress CV keeps whatever photo (or none) the user actually set.
  const photoFallback = usingDemo && !source.photo
    ? {
      photo: PLACEHOLDER_PROFILE_PHOTO,
      photoVisibilityByTemplate: {
        ...source.photoVisibilityByTemplate,
        ...Object.fromEntries(PHOTO_FREE_TEMPLATE_IDS.map((id) => [id, false])),
      },
    }
    : null

  return {
    ...source,
    ...photoFallback,
    about: (source.about ?? '').slice(0, THUMBNAIL_ABOUT_LENGTH),
    experience: take(source.experience, THUMBNAIL_EXPERIENCE_COUNT),
    education: take(source.education, THUMBNAIL_EDUCATION_COUNT),
    skills: take(source.skills, THUMBNAIL_SKILL_COUNT),
    projects: take(source.projects, THUMBNAIL_ITEM_COUNT),
    certificates: take(source.certificates, THUMBNAIL_ITEM_COUNT),
    coreStrengths: take(source.coreStrengths, THUMBNAIL_ITEM_COUNT),
    languages: take(source.languages, THUMBNAIL_ITEM_COUNT),
  }
}
