import { Avatar, Box, MenuItem, Select, SelectChangeEvent, Skeleton, Stack, styled, Typography } from "@mui/material";
import { memo, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { getUserStoragePolicies } from "../../../api/api.ts";
import { PolicyType, StoragePolicy } from "../../../api/explorer.ts";
import { useAppDispatch, useAppSelector } from "../../../redux/hooks.ts";
import { setPolicyOptionCache, setSelectedPolicyId } from "../../../redux/globalStateSlice.ts";
import { RadiusFrame } from "../RadiusFrame.tsx";

const StyledBox = styled(RadiusFrame)(({ theme }) => ({
  padding: theme.spacing(1, 2, 1, 2),
  margin: theme.spacing(0, 2, 0, 2),
}));

const PolicyTypeImageMap: Record<PolicyType, string> = {
  [PolicyType.local]: "/static/img/local.png",
  [PolicyType.remote]: "/static/img/remote.png",
  [PolicyType.s3]: "/static/img/s3.png",
  [PolicyType.oss]: "/static/img/oss.png",
  [PolicyType.cos]: "/static/img/cos.png",
  [PolicyType.qiniu]: "/static/img/qiniu.png",
  [PolicyType.upyun]: "/static/img/upyun.png",
  [PolicyType.onedrive]: "/static/img/onedrive.png",
  [PolicyType.ks3]: "/static/img/ks3.png",
  [PolicyType.obs]: "/static/img/obs.png",
  [PolicyType.load_balance]: "/static/img/lb.svg",
};

const PolicyTypeNameMap: Record<PolicyType, string> = {
  [PolicyType.local]: "dashboard:policy.local",
  [PolicyType.remote]: "dashboard:policy.remote",
  [PolicyType.s3]: "dashboard:policy.s3",
  [PolicyType.oss]: "dashboard:policy.oss",
  [PolicyType.cos]: "dashboard:policy.cos",
  [PolicyType.qiniu]: "dashboard:policy.qiniu",
  [PolicyType.upyun]: "dashboard:policy.upyun",
  [PolicyType.onedrive]: "dashboard:policy.onedrive",
  [PolicyType.ks3]: "dashboard:policy.ks3",
  [PolicyType.obs]: "dashboard:policy.obs",
  [PolicyType.load_balance]: "dashboard:policy.load_balance",
};

interface PolicyOptionDisplayProps {
  policy: StoragePolicy;
}

const PolicyOptionDisplay = ({ policy }: PolicyOptionDisplayProps) => {
  const { t } = useTranslation("dashboard");
  const imgSrc = PolicyTypeImageMap[policy.type] ?? "";
  const providerName = PolicyTypeNameMap[policy.type] ? t(PolicyTypeNameMap[policy.type]) : policy.type;

  return (
    <Stack direction="row" alignItems="center" spacing={1.5} sx={{ overflow: "hidden" }}>
      <Avatar
        src={imgSrc}
        variant="rounded"
        sx={{
          width: 32,
          height: 32,
          flexShrink: 0,
          bgcolor: "action.hover",
        }}
        slotProps={{ img: { style: { objectFit: "contain", padding: 4 } } }}
      />
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: 500,
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
          }}
        >
          {policy.name}
        </Typography>
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            overflow: "hidden",
            display: "block",
          }}
        >
          {providerName}
        </Typography>
      </Box>
    </Stack>
  );
};

const StoragePolicySwitcher = memo(() => {
  const { t } = useTranslation("application");
  const dispatch = useAppDispatch();
  const policies = useAppSelector((state) => state.globalState.policyOptionCache);
  const selectedPolicyId = useAppSelector((state) => state.globalState.selectedPolicyId);

  useEffect(() => {
    if (!policies) {
      dispatch(getUserStoragePolicies()).then((res) => {
        if (res && Array.isArray(res)) {
          dispatch(setPolicyOptionCache(res));
          if (res.length > 0 && !selectedPolicyId) {
            dispatch(setSelectedPolicyId(res[0].id));
          }
        }
      });
    }
  }, [policies, dispatch, selectedPolicyId]);

  const handleChange = useCallback(
    (e: SelectChangeEvent<string>) => {
      dispatch(setSelectedPolicyId(e.target.value));
    },
    [dispatch],
  );

  if (!policies) {
    return (
      <StyledBox withBorder>
        <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
          {t("navbar.storagePolicy")}
        </Typography>
        <Skeleton variant="rounded" height={40} />
      </StyledBox>
    );
  }

  if (policies.length === 0) {
    return null;
  }

  return (
    <StyledBox withBorder>
      <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
        {t("navbar.storagePolicy")}
      </Typography>
      <Select<string>
        value={selectedPolicyId ?? ""}
        onChange={handleChange}
        size="small"
        fullWidth
        variant="outlined"
        displayEmpty
        MenuProps={{
          PaperProps: {
            sx: { maxHeight: 300 },
          },
        }}
        sx={{
          "& .MuiSelect-select": {
            py: 0.75,
            display: "flex",
            alignItems: "center",
          },
        }}
        renderValue={(value) => {
          const selected = policies.find((p) => p.id === value);
          if (!selected) return null;
          return <PolicyOptionDisplay policy={selected} />;
        }}
      >
        {policies.map((policy) => (
          <MenuItem key={policy.id} value={policy.id}>
            <PolicyOptionDisplay policy={policy} />
          </MenuItem>
        ))}
      </Select>
    </StyledBox>
  );
});

export default StoragePolicySwitcher;
